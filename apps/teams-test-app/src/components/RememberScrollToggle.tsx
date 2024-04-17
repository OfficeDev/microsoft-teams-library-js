import throttle from 'lodash.throttle';
import React, { useEffect, useState } from 'react';

const RememberScrollToggle = () => {
  // Initialize the toggle state from sessionStorage
  const [isScrollFeatureActive, setIsScrollFeatureActive] = useState(
    () => JSON.parse(sessionStorage.getItem('isScrollFeatureActive') || '{}') ?? true,
  );

  useEffect(() => {
    // Save the toggle state to sessionStorage whenever it changes
    sessionStorage.setItem('isScrollFeatureActive', JSON.stringify(isScrollFeatureActive));

    console.log('scrolling');

    if (!isScrollFeatureActive) {
      return;
    }

    const handleScroll = throttle(() => {
      const scrollPosition = window.scrollY;
      sessionStorage.setItem('iframeScrollPosition', JSON.stringify(scrollPosition));
      console.log('scrolling');
    }, 2000);

    window.addEventListener('scroll', handleScroll);

    const savedScrollPosition = sessionStorage.getItem('iframeScrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, JSON.parse(savedScrollPosition));
      }, 100);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrollFeatureActive]);
  return (
    <div style={{ marginTop: '2em', marginLeft: '1em' }}>
      <label>
        remember scroll position
        <input
          type="checkbox"
          checked={isScrollFeatureActive}
          aria-label="remember scroll position"
          onChange={(e) => setIsScrollFeatureActive(e.target.checked)}
        />
      </label>
    </div>
  );
};

export default RememberScrollToggle;
