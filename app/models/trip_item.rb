class TripItem < ActiveRecord::Base
  belongs_to :trip
  belongs_to :location
  has_many :photos
end
