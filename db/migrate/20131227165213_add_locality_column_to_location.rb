class AddLocalityColumnToLocation < ActiveRecord::Migration
  def change
    add_column :locations, :locality, :string
  end
end
