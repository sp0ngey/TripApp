require 'pp'

class LandingController < ApplicationController
  def index
    #Geocoder::Result::Google
    if params[:location].blank?
      #TODO need to handle empty string search
    else
      @trips = Trip.all
      @search_location = Geocoder.search(params[:location])
      @hash_coord = [{"lat" => @search_location.first.coordinates[0], "lng" => @search_location.first.coordinates[1]}]

      dump = PP.pp(@trips, "")
      logger.debug dump
    end

    render :index

  end
end
