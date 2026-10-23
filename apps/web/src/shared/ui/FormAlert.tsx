/** A message under a form that something did not work, read out at once. */
export function FormAlert({ message }: { message: string | undefined }) {
  if (message === undefined) return null;
  return (
    <p
      role="alert"
      className="m-0 animate-enter rounded-button border border-danger bg-surface px-3 py-2.5 text-body-sm font-medium text-danger-text"
    >
      {message}
    </p>
  );
}
