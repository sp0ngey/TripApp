#
# Adding generic geocoding fields to the locations table and removing specific columns city and address
class AddGeocodeFieldsToLocation < ActiveRecord::Migration
  def self.up
    add_column :locations, :admin_area_1, :string
    add_column :locations, :admin_area_2, :string
    add_column :locations, :admin_area_3, :string
    add_column :locations, :formatted_address, :string

    remove_column :locations, :city
    remove_column :locations, :address
  end

  def self.down
    add_column :locations, :city, :string
    add_column :locations, :address, :string

    remove_column :locations, :admin_area_1
    remove_column :locations, :admin_area_2
    remove_column :locations, :admin_area_3
    remove_column :locations, :formatted_address
  end
end
