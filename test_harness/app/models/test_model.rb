class TestModel < ActiveRecord::Base
  validates_numericality_of :weight, :message => 'Weight must be a number, silly!'
  validates_presence_of :selectable_one, :message => 'Man, get something out of the dropdown!'
end
