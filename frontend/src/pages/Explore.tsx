import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, Users, CheckCircle } from 'lucide-react';

export default function Explore() {
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  const handleActionClick = () => {
    setShowSignUpPrompt(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ServiceDesk Demo</h1>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Sign Up
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div 
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleActionClick}
          >
            <Ticket className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Create Ticket</h3>
            <p className="mt-2 text-gray-600">Submit a new support request for any issues you're experiencing.</p>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleActionClick}
          >
            <Clock className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Track Progress</h3>
            <p className="mt-2 text-gray-600">Monitor the status and updates of your submitted tickets.</p>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleActionClick}
          >
            <Users className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Collaborate</h3>
            <p className="mt-2 text-gray-600">Work with support agents to resolve your issues efficiently.</p>
          </div>
        </div>

        {showSignUpPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Create an Account to Continue
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Sign up to access all features and start managing your support tickets.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/signup"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create Account
                </Link>
                <button
                  onClick={() => setShowSignUpPrompt(false)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}