class CreateCountryAbbreviations < ActiveRecord::Migration
  def change
    create_table :country_abbreviations do |t|
      t.string :short_name

      t.timestamps
    end
  end
end
