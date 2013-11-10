class LandingController < ApplicationController
  def index
    if params[:text].blank?
      #TODO need to handle empty string search
    else
      @search_location = Geocoder.coordinates(params[:text])
      @hash_coord = [{"lat" => @search_location[0], "lng" => @search_location[1]}]
    end

  end

  def login
  end

  def browse
  end
end
