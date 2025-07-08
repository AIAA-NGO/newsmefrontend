// Spinner.js
const Spinner = ({ size = 'md' }) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12'
    };
  
    return (
      <div className="flex justify-center items-center">
        <div className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-b-2 border-blue-500`}></div>
      </div>
    );
  };
  
  export default Spinner;