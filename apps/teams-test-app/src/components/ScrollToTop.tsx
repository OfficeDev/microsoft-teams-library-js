import React, { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Function to check scroll position and set visibility
  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      // Adjust 500 to the scroll position you deem appropriate
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Function to scroll to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scroll
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div>
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            height: '50px',
            width: '50px',
            fontSize: '25px',
            zIndex: 1000,
            cursor: 'pointer',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#3498db',
            color: 'white',
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
