class ChangeDefaultForTripsUpVote < ActiveRecord::Migration
  def change
    change_column :trips, :up_vote, :integer, :default => 0
  end
end
