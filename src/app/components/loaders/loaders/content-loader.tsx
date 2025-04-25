
export default function ContentLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="z-50">
      <div className="text-center flex justify-center items-center gap-1">
        <div className="bg-primary-600 p-1 w-3 h-3 rounded-full animate-bounce"></div>
        <div className="bg-primary-600 p-1 w-3 h-3 rounded-full animate-bounce"></div>
        <div className="bg-primary-600 p-1 w-3 h-3 rounded-full animate-bounce"></div>
        <p className="text-xl font-semibold text-gray-700 ms-2">
          {message}
        </p>
      </div>
    </div>
  );
}