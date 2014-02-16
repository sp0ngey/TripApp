class ChangeDefaultForTripsDownVote < ActiveRecord::Migration
  change_column :trips, :down_vote, :integer, :default => 0
end
