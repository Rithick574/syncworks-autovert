export default function Skeleton({
  width,
  height,
}: {
  width: string;
  height: string;
}) {
  return (
    <div
      className={`dark:dark-bg animate-pulse rounded`}
      style={{ width, height }}
    ></div>
  );
}
