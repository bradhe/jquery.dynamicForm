class AddSelectablesToTestModels < ActiveRecord::Migration
  def self.up
    add_column :test_models, :selectable_one, :integer
    add_column :test_models, :selectable_two, :string
  end

  def self.down
    remove_column :test_models, :selectable_two
    remove_column :test_models, :selectable_one
  end
end
