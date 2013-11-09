class Location < ActiveRecord::Base
  attr_accessible :address, :longitude, :latitude, :city, :country
  geocoded_by :address do |obj, results|
    if geo = results.first
      obj.longitude = geo.longitude
      obj.latitude = geo.latitude
      obj.city = geo.city
      obj.country = geo.country_code

    end
  end
  after_validation :geocode


end
