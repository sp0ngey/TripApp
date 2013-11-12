class CreateTripItems < ActiveRecord::Migration
  def change
    create_table :trip_items do |t|
      t.string :name
      t.text :description
      t.date :start_date
      t.date :end_date
      t.integer :trip_id
      t.integer :location_id

      t.timestamps
    end
  end
end
