require 'pp'

class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    dump = PP.pp(auth, "")
    logger.debug dump

    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.create_with_omniauth(auth)
    session[:user_id] = user.id
    respond_to do |format|
      format.html { redirect_to root_url }
      format.json { render json:  {:status => "OK"} }
    end
  end

  def failure()
    respond_to do |format|
      format.html { redirect_to root_url }
      format.json { render json:  {:status => "FAIL", :reason => params['message']} }
    end
  end

  def destroy
    session[:user_id] = nil
    logger.debug("Session id is " + ((session[:user_id].nil?) ? "NIL" : session[:user_id]));
    redirect_to root_url, :notice => "Signed out!"
  end
end
