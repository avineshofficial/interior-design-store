import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        {/* Animated SVG */}
        <svg className="not-found-svg" viewBox="0 0 800 600">
          <defs>
            <clipPath id="clip">
              <path d="M 0 0 L 800 0 L 800 600 L 0 600 Z" />
            </clipPath>
          </defs>

          {/* Text "404" */}
          <text className="four-oh-four" x="50%" y="50%" dy=".35em" textAnchor="middle">
            404
          </text>

          {/* Animated floating stars */}
          <g clipPath="url(#clip)">
            <g className="stars-g">
              <path className="star" d="M296 252 L308.23 240.23 L296 228 L283.77 240.23 Z" />
              <path className="star" d="M433 392 L441.93 383.93 L433 375 L424.07 383.93 Z" />
              <path className="star" d="M129 175 L144.33 161.33 L129 147 L113.67 161.33 Z" />
              <path className="star" d="M601 138 L609.67 130.17 L601 122 L592.33 130.17 Z" />
              <path className="star" d="M228 442 L241.97 430.47 L228 418 L214.03 430.47 Z" />
              <path className="star" d="M670 416 L680.13 406.87 L670 397 L659.87 406.87 Z" />
              <path className="star" d="M181 303 L194.27 290.73 L181 278 L167.73 290.73 Z" />
            </g>
          </g>
        </svg>

        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          Sorry, we couldn't find the page you were looking for.
        </p>
        <Link to="/" className="not-found-home-button">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;