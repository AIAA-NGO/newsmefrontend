import PropTypes from 'prop-types';

const LoadingSpinner = ({ fullScreen = false, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-t-transparent ${sizes[size]} ${className}`}>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  fullScreen: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default LoadingSpinner;