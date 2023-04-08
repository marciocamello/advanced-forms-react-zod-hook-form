interface LabelProps {
    name: string;
}

export function Label({ name }: LabelProps) {
    return <label htmlFor={name}>{name}</label>;
}