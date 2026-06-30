const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-gray-500">{text}</p>
    </div>
  );
};

export default Loader;
