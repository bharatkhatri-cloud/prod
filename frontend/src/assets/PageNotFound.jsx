import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <section className="bg- dark:bg--900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-teal-600 dark:text-teal-500">404</h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-teal-900 md:text-4xl dark:text-teal">Something's missing.</p>
          <p className="mb-4 text-lg font-light text-teal-500 dark:text-teal-400">Sorry, we can't find that page. You'll find lots to explore on the home page.</p>
          <Link to="/" className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4text-teal-700 hover:text-white border border-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-teal-500 dark:text-teal-500 dark:hover:text-white dark:hover:bg-teal-500 dark:focus:ring-teal-800">Back to Homepage</Link>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound;
