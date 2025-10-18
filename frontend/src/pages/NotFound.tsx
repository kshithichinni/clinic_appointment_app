import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4 py-12">
      <h1 className="text-7xl font-extrabold text-destructive mb-4">404</h1>
      <p className="text-2xl font-semibold text-foreground mb-2">Page Not Found</p>
      <p className="text-muted-foreground max-w-md mb-6">
        Sorry, the page you are looking for doesn’t exist, has been removed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-primary text-black rounded-xl shadow-md hover:bg-primary/80 transition-colors duration-200"
      >
        ⬅ Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
