class Photo < ActiveRecord::Base
  belongs_to :trip_item

  has_attached_file :image, :styles => { :medium => "300x300>" },
                    :url => "/assets/:class/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/:class/:id/:style/:basename.:extension"

  # Validate content type
  validates_attachment_presence :image
  validates_attachment_content_type :image, :content_type => ['image/jpeg', 'image/png', 'image/jpg']


end
