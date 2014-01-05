class Trip < ActiveRecord::Base
  belongs_to :user
  has_many :trip_items

  def self.search(keyword)
    if keyword

      find(:all, :joins => 'LEFT OUTER JOIN trip_items ON trips.id = trip_items.trip_id
                            LEFT OUTER JOIN locations ON locations.id = trip_items.location_id',
                 :group => 'trips.id',
                 :conditions => ['trips.name LIKE :keyword OR
                                  trip_items.name LIKE :keyword OR
                                  trips.description LIKE :keyword OR
                                  trip_items.description LIKE :keyword OR
                                  locations.country_name LIKE :keyword', :keyword => "%#{keyword}%"])

    else
      find(:all)
    end
  end

  # Make a default value of zero if nil
  def up_vote
    self[:up_vote] || 0
  end

  # Make a default value of zero if nil
  def down_vote
    self[:down_vote] || 0
  end

end
