import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from math import radians, cos, sin, asin, sqrt
import joblib
import xgboost as xgb
from sklearn.base import BaseEstimator, ClassifierMixin
import shap

# ------- Preprocessing function -------
def preprocessData(filepath):
    df = pd.read_csv(filepath, low_memory=False)

    if 'Unnamed: 0' not in df.columns:
        df['Unnamed: 0'] = 0  # dummy column

    df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'], dayfirst=True, errors='coerce')
    df = df.dropna(subset=['trans_date_trans_time']).reset_index(drop=True)

    df['hour'] = df['trans_date_trans_time'].dt.hour
    df['day_of_week'] = df['trans_date_trans_time'].dt.dayofweek
    df['day'] = df['trans_date_trans_time'].dt.day
    df['month'] = df['trans_date_trans_time'].dt.month

    df = df.sort_values(['cc_num', 'trans_date_trans_time']).reset_index(drop=True)
    df['prev_trans_time'] = df.groupby('cc_num')['trans_date_trans_time'].shift(1)
    df['time_diff_sec'] = (df['trans_date_trans_time'] - df['prev_trans_time']).dt.total_seconds()
    df['time_diff_sec'] = df['time_diff_sec'].fillna(df['time_diff_sec'].median())

    def haversine(lat1, lon1, lat2, lon2):
        if pd.isnull(lat1) or pd.isnull(lon1) or pd.isnull(lat2) or pd.isnull(lon2):
            return 0
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km

    df['dist_trans_merch'] = df.apply(lambda r: haversine(r['lat'], r['long'], r['merch_lat'], r['merch_long']), axis=1)
    df['prev_lat'] = df.groupby('cc_num')['lat'].shift(1)
    df['prev_long'] = df.groupby('cc_num')['long'].shift(1)
    df['dist_prev_trans'] = df.apply(lambda r: haversine(r['lat'], r['long'], r['prev_lat'], r['prev_long']), axis=1)

    card_stats = df.groupby('cc_num')['amt'].agg(['mean', 'std', 'count']).reset_index()
    card_stats.columns = ['cc_num', 'avg_amt', 'std_amt', 'trans_count']
    card_stats.fillna(0, inplace=True)

    df = df.merge(card_stats, on='cc_num', how='left')
    df['amt_diff_avg'] = abs(df['amt'] - df['avg_amt'])

    # Encode categoricals
    if 'transaction_type' in df.columns:
        trans_type_col = 'transaction_type'
    elif 'trannsaction_type' in df.columns:
        trans_type_col = 'trannsaction_type'
    else:
        raise ValueError("Transaction type column not found")

    df[trans_type_col] = df[trans_type_col].fillna('Unknown')
    le_type = LabelEncoder()
    df['trans_type_enc'] = le_type.fit_transform(df[trans_type_col])

    df['city'] = df['city'].fillna('Unknown')
    le_city = LabelEncoder()
    df['city_enc'] = le_city.fit_transform(df['city'])

    drop_cols = ['trans_date_trans_time', 'cc_num', 'trans_num', 'prev_trans_time',
                 'prev_lat', 'prev_long', trans_type_col, 'city']
    df.drop(columns=drop_cols, inplace=True, errors='ignore')

    df = df.fillna(df.median(numeric_only=True))

    feature_order = ['Unnamed: 0', 'amt', 'lat', 'long', 'merch_lat', 'merch_long', 'hour', 'day_of_week',
                     'day', 'month', 'time_diff_sec', 'dist_trans_merch', 'dist_prev_trans', 'avg_amt', 'std_amt',
                     'trans_count', 'amt_diff_avg', 'trans_type_enc', 'city_enc']

    df = df[feature_order]
    return df

# ------- Ensemble Classifier -------
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

# ------- SHAP explanation function -------
def explain_fraud(df: pd.DataFrame):
    # Load random forest model (SHAP needs the original RF for TreeExplainer)
    rf_model = joblib.load("rf_model.pkl")
    explainer = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(df)

    # Handle multiclass output (class 1 = fraud)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    row_idx = 0  # we explain only the first row

    # Safely extract SHAP value scalar
    def get_scalar_shap(val):
        if isinstance(val, (list, tuple, pd.Series)):
            val = val[0]
        elif hasattr(val, 'flatten') and val.size > 1:
            val = val.flatten()[0]
        return float(val)

    top_features = sorted(
        [
            (df.columns[i], df.iloc[row_idx, i], get_scalar_shap(shap_values[row_idx][i]))
            for i in range(len(df.columns))
        ],
        key=lambda x: -abs(x[2])
    )[:5]

    reasons = [
        f"Feature '{feature}' with value '{value}' contributed {'positively' if impact > 0 else 'negatively'} "
        f"({'+' if impact > 0 else '-'}{abs(impact):.4f}) to the fraud prediction."
        for feature, value, impact in top_features
    ]
    return reasons

# ------- Main inference code -------
def run_inference(filepath):
    xgb_model = xgb.Booster()
    xgb_model.load_model("xgb_model.json")  # if saved by xgb's own method

    rf_model = joblib.load("rf_model.pkl")

# Create ensemble
    ensemble_model = EnsembleClassifier(xgb_model, rf_model)
    # Preprocess input CSV
    df_input = preprocessData(filepath)

    # Predict
    prob = ensemble_model.predict_proba(df_input)[0,1]
    pred_flag = int(prob >= ensemble_model.threshold)

    # Explain using SHAP on random forest only, on the preprocessed input row
    reasons = explain_fraud(df_input)

    return pred_flag, prob, reasons
    
    

