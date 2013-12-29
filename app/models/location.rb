class Location < ActiveRecord::Base
  has_many :trip_items
  attr_accessible :address, :longitude, :latitude, :city, :country, :country_name
  geocoded_by :address do |obj, results|
    if geo = results.first
      obj.longitude = geo.longitude
      obj.latitude = geo.latitude
      obj.city = geo.city
      obj.country = geo.country_code
      obj.country_name = geo.country

    end
  end
  after_validation :geocode


end
