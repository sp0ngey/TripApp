class AddCountryNameToLocations < ActiveRecord::Migration
  def change
    add_column :locations, :country_name, :string

  end
end
