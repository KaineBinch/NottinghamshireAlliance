export const Styles = () => (
  <style>{`
    @keyframes tvScroll {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-50%);
      }
    }

    .bg-grid-pattern {
      background-image: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.1) 25%,
          transparent 25%
        ),
        linear-gradient(
          -45deg,
          rgba(255, 255, 255, 0.1) 25%,
          transparent 25%
        ),
        linear-gradient(
          45deg,
          transparent 75%,
          rgba(255, 255, 255, 0.1) 75%
        ),
        linear-gradient(
          -45deg,
          transparent 75%,
          rgba(255, 255, 255, 0.1) 75%
        );
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }

    .bg-pattern-dots {
      background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.3) 1px,
        transparent 1px
      );
      background-size: 15px 15px;
    }
  `}</style>
)