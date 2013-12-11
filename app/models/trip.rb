class Trip < ActiveRecord::Base
  belongs_to :user
  has_many :trip_items

  # Make a default value of zero if nil
  def up_vote
    self[:up_vote] || 0
  end

  # Make a default value of zero if nil
  def down_vote
    self[:down_vote] || 0
  end

end
