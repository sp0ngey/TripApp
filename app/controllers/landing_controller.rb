class LandingController < ApplicationController
  def index
    #Geocoder::Result::Google
    if params[:location].blank?
      #TODO need to handle empty string search
    else
      @search_location = Geocoder.search(params[:location])
      @hash_coord = [{"lat" => @search_location.first.coordinates[0], "lng" => @search_location.first.coordinates[1]}]
    end

  end

  def login
  end

  def browse
  end
end
