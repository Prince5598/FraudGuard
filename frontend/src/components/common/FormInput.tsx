import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  required = false,
  helpText,
  type = 'text',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
          ${errors[name] ? 'border-red-300' : 'border-gray-300'}
        `}
        {...register(name)}
        {...props}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[name]?.message as string}
        </p>
      )}
      {helpText && !errors[name] && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default FormInput;