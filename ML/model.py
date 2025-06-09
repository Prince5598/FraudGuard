import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.base import BaseEstimator, ClassifierMixin
from imblearn.over_sampling import SMOTE
import xgboost as xgb
from math import radians, cos, sin, asin, sqrt
import pickle
import joblib
# Load data
df = pd.read_csv('fraudTrain.csv', low_memory=False)

df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'], dayfirst=True, errors='coerce')
df = df.dropna(subset=['trans_date_trans_time']).reset_index(drop=True)

# Extract datetime features
df['hour'] = df['trans_date_trans_time'].dt.hour
df['day_of_week'] = df['trans_date_trans_time'].dt.dayofweek
df['day'] = df['trans_date_trans_time'].dt.day
df['month'] = df['trans_date_trans_time'].dt.month

# ---------------------------
# 3. Sort for time difference
df = df.sort_values(['cc_num', 'trans_date_trans_time']).reset_index(drop=True)
df['prev_trans_time'] = df.groupby('cc_num')['trans_date_trans_time'].shift(1)
df['time_diff_sec'] = (df['trans_date_trans_time'] - df['prev_trans_time']).dt.total_seconds()
df['time_diff_sec'] = df['time_diff_sec'].fillna(df['time_diff_sec'].median())

# ---------------------------
# 4. Haversine distance function
def haversine(lat1, lon1, lat2, lon2):
    if pd.isnull(lat1) or pd.isnull(lon1) or pd.isnull(lat2) or pd.isnull(lon2):
        return 0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km

df['dist_trans_merch'] = df.apply(lambda r: haversine(r['lat'], r['long'], r['merch_lat'], r['merch_long']), axis=1)
df['prev_lat'] = df.groupby('cc_num')['lat'].shift(1)
df['prev_long'] = df.groupby('cc_num')['long'].shift(1)
df['dist_prev_trans'] = df.apply(lambda r: haversine(r['lat'], r['long'], r['prev_lat'], r['prev_long']), axis=1)

# ---------------------------
# 5. Card aggregates
card_stats = df.groupby('cc_num')['amt'].agg(['mean', 'std', 'count']).reset_index()
card_stats.columns = ['cc_num', 'avg_amt', 'std_amt', 'trans_count']
df = df.merge(card_stats, on='cc_num', how='left')
df['amt_diff_avg'] = abs(df['amt'] - df['avg_amt'])

# ---------------------------
# 6. Fix typos and encode categoricals
if 'transaction_type' in df.columns:
    trans_type_col = 'transaction_type'
elif 'trannsaction_type' in df.columns:
    trans_type_col = 'trannsaction_type'
else:
    raise ValueError("Transaction type column not found")

le_type = LabelEncoder()
df[trans_type_col] = df[trans_type_col].fillna('Unknown')
df['trans_type_enc'] = le_type.fit_transform(df[trans_type_col])

le_city = LabelEncoder()
df['city'] = df['city'].fillna('Unknown')
df['city_enc'] = le_city.fit_transform(df['city'])

# ---------------------------
# 7. Drop unused columns
drop_cols = ['trans_date_trans_time', 'cc_num', 'trans_num', 'prev_trans_time', 'prev_lat', 'prev_long', trans_type_col, 'city']
df.drop(columns=drop_cols, inplace=True)

# ---------------------------
# 8. Prepare X and y
X = df.drop(columns=['is_fraud'])
y = df['is_fraud']
mask = y.notnull()
X = X[mask]
y = y[mask]
X = X.fillna(X.median())


# -------------------- Train/Test Split and SMOTE --------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.3, random_state=42)
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

# Further split for validation
X_train_final, X_val, y_train_final, y_val = train_test_split(X_train_res, y_train_res, test_size=0.2, random_state=42)

# -------------------- Model Training --------------------
# 1. Random Forest
rf_model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf_model.fit(X_train_final, y_train_final)

# 2. XGBoost
dtrain = xgb.DMatrix(X_train_final, label=y_train_final)
dval = xgb.DMatrix(X_val, label=y_val)
dtest = xgb.DMatrix(X_test)

params = {
    'objective': 'binary:logistic',
    'eval_metric': 'auc',
    'max_depth': 6,
    'learning_rate': 0.05,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'seed': 42
}

xgb_model = xgb.train(params, dtrain, num_boost_round=500, evals=[(dtrain, 'train'), (dval, 'val')],
                      early_stopping_rounds=30, verbose_eval=False)

# -------------------- Ensemble Model --------------------
class EnsembleClassifier(BaseEstimator, ClassifierMixin):
    def __init__(self, xgb_model, rf_model, weights=None, threshold=0.5):
        self.xgb_model = xgb_model
        self.rf_model = rf_model
        self.weights = weights or [0.5, 0.5]
        self.threshold = threshold

    def predict_proba(self, X):
        dmatrix = xgb.DMatrix(X)
        xgb_prob = self.xgb_model.predict(dmatrix)
        rf_prob = self.rf_model.predict_proba(X)[:, 1]
        combined_prob = self.weights[0] * xgb_prob + self.weights[1] * rf_prob
        return np.vstack([1 - combined_prob, combined_prob]).T

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= self.threshold).astype(int)

ensemble_model = EnsembleClassifier(xgb_model, rf_model)

# -------------------- Evaluation --------------------
def evaluate_model(name, model, X, y):
    print(f"\n---- {name} Evaluation ----")
    if isinstance(model, xgb.Booster):
        proba = model.predict(xgb.DMatrix(X))
        preds = (proba >= 0.5).astype(int)
    else:
        proba = model.predict_proba(X)[:, 1]
        preds = model.predict(X)
    print("Accuracy:", accuracy_score(y, preds))
    print("ROC-AUC:", roc_auc_score(y, proba))
    print("Classification Report:\n", classification_report(y, preds))

evaluate_model("XGBoost", xgb_model, X_test, y_test)
evaluate_model("RandomForest", rf_model, X_test, y_test)
evaluate_model("Ensemble", ensemble_model, X_test, y_test)

# Save Random Forest
with open("rf_model.pkl", "wb") as f:
    pickle.dump(rf_model, f)

# Save XGBoost using XGBoost's own save function (recommended)
xgb_model.save_model("xgb_model.json")

