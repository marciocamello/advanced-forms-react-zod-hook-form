import { useFormContext } from 'react-hook-form';

interface ErrorMessageProps {
    field: string;
}

export function ErrorMessage({ field }: ErrorMessageProps) {
    const { formState: { errors } } = useFormContext();
    const errorField = errors?.[field];

    if (!errorField) return null;

    return (
        <span className="text-red-500">{errorField.message?.toString()}</span>
    )
}