require 'pp'

class LandingController < ApplicationController
  def index
    #Geocoder::Result::Google

    @currentUser =  current_user();
    @trips = Trip.find_all_by_user_id( current_user().id )
    dump = PP.pp(@trips, "")
    logger.debug("DBG> Landing controller> " + dump);

    if params[:location].blank?
      #TODO need to handle empty string search
      logger.debug "DBG> Landing controller> No location entered"
    else
      @search_location = Geocoder.search(params[:location])
      @hash_coord = [{"lat" => @search_location.first.coordinates[0], "lng" => @search_location.first.coordinates[1]}]
      logger.debug "DBG> Landing controller> Location enetered, generating search location: "
    end

    render :index

  end
end
