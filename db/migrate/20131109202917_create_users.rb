class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :login_type
      t.string :first_name
      t.string :last_name
      t.string :username

      t.timestamps
    end
  end
end
