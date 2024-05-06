import throttle from 'lodash.throttle';
import React, { useEffect, useState } from 'react';

const THROTTLE_TIME = 2000;

const RememberScrollToggle = (): JSX.Element => {
  const [isScrollFeatureActive, setIsScrollFeatureActive] = useState(
    () => JSON.parse(sessionStorage.getItem('isScrollFeatureActive') || '{}') ?? true,
  );

  useEffect(() => {
    sessionStorage.setItem('isScrollFeatureActive', JSON.stringify(isScrollFeatureActive));

    if (!isScrollFeatureActive) {
      return;
    }

    const handleScroll = throttle(() => {
      const scrollPosition = window.scrollY;
      sessionStorage.setItem('iframeScrollPosition', JSON.stringify(scrollPosition));
    }, THROTTLE_TIME);

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
