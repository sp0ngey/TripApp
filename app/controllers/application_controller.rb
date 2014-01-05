class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user


  #
  # Helper method to make the application variable @current_user available in a more friendly fashion.
  def current_user

    logger.debug "DBG> Checking session " + session.inspect

    if session[:user_id]
      begin
        @current_user ||= User.find(session[:user_id])
      rescue
        # The session cookie contains an invalid user_id. Could be a stale cookie, for example.
        session[:user_id] = nil
        @current_user = nil
      end
    else
      @current_user = nil
    end

    return @current_user
  end
end



