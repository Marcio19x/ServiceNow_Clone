import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, LogIn, Rocket } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to ServiceDesk
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            The modern solution for ticket management. Create, track, and resolve tickets efficiently.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Link>
            
            <Link
              to="/signin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Link>
            
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Explore as Guest
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Easy Ticket Creation</h3>
            <p className="mt-2 text-gray-600">Create and submit support tickets in seconds with our intuitive interface.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
            <p className="mt-2 text-gray-600">Stay informed with instant notifications and status updates on your tickets.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Efficient Resolution</h3>
            <p className="mt-2 text-gray-600">Get your issues resolved quickly with our streamlined support process.</p>
          </div>
        </div>
      </div>
    </div>
  );
}