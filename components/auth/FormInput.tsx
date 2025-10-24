interface FormInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    maxLength?: number;
    className?: string;
}

export default function FormInput({
    label,
    type,
    value,
    onChange,
    required = false,
    maxLength,
    className = "",
}: FormInputProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
                type={type}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                maxLength={maxLength}
            />
        </div>
    );
}
