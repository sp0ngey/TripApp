class Location < ActiveRecord::Base
  has_many :trip_items
  attr_accessible :longitude, :latitude, :city

#  geocoded_by :address do |obj, results|
#    if geo = results.first
#      obj.longitude = geo.longitude
#      obj.latitude = geo.latitude
#      obj.city = geo.city
#      obj.country = geo.country_code
#    end
  #end
  #after_validation :geocode
end
