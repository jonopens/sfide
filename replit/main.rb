
# '[
#  {"op": "delete", "count": 7},
#  {"op": "insert", "chars": "We"},
#  {"op": "skip", "count": 4},
#  {"op": "delete", "count": 1}
# ]'

# insert and skip move cursor, delete does not

# You can't skip past the end of a string
# You can't delete past the end of a string
# Delete operations are applied forward while keeping the cursor in place

require 'json'

class Cursor
  attr_accessor :position
  
  def initialize
    @position = 0
  end
end

class Document
  attr_accessor :text

  def initialize(text)
    @text = text
  end

  def length
    @text.length
  end
end

class Operation
  attr_reader :action, :count, :chars, :document, :cursor

  def initialize(op_hash, cursor, document)
    @action = op_hash['op']
    @count = op_hash['count'] || nil
    @chars = op_hash['chars'] || nil
    @document = document
    @cursor = cursor
  end
  
  def skip
    @cursor.position += @count
  end

  def delete
    delete_end_char = @count + @cursor.position
    @document.text.slice!(@cursor.position..delete_end_char)
  end

  def insert
    @document.text.insert(@cursor.position, @chars)
    @cursor.position += @chars.length
  end
end

class OperationTransformer
  def self.transform(op)
    case op.action
    when 'skip'
      op.skip
    when 'delete'
      op.delete
    when 'insert'
      op.insert
    else
      raise NoMethodError
    end
  end
end

class OperationValidator
  def self.valid?(op, cursor, document)
    case op.action
    when 'skip'
      op.count + cursor.position > 0 &&
      op.count + cursor.position < document.length - 1
    when 'delete'
      op.count + cursor.position < document.length - 1
    when 'insert'
      cursor.position > 0
    else
      raise NoMethodError
    end
  end
end

class ChangesetValidator
  def initialize(stale, latest, otjson)
    @cursor = Cursor.new
    @stale = Document.new(stale)
    @latest = Document.new(latest)
    @op_set = JSON.parse(otjson).map { |op_hash| Operation.new(op_hash, @cursor, @stale) }
    self.valid_changeset?
  end

  def valid_changeset?
    is_valid = false

    if @op_set.all? { |op| OperationValidator.valid?(op, @cursor, @stale) }
      @op_set.each { |op| OperationTransformer.transform(op) }

      is_valid = @stale.text == @latest.text
    end

    puts "changeset is valid: #{is_valid}"
    is_valid
  end
end

ChangesetValidator.new(
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  'Repl.it uses operational transformations.',
  '[{"op": "skip", "count": 40}, {"op": "delete", "count": 47}]'
); # true

ChangesetValidator.new(
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  'Repl.it uses operational transformations.',
  '[{"op": "skip", "count": 45}, {"op": "delete", "count": 47}]'
); # false, delete past end

ChangesetValidator.new(
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  'Repl.it uses operational transformations.',
  '[{"op": "skip", "count": 40}, {"op": "delete", "count": 47}, {"op": "skip", "count": 2}]'
); # false, skip past end

ChangesetValidator.new(
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  'We use operational transformations to keep everyone in a multiplayer repl in sync.',
  '[{"op": "delete", "count": 7}, {"op": "insert", "chars": "We"}, {"op": "skip", "count": 4}, {"op": "delete", "count": 1}]'
); # true
  
ChangesetValidator.new(
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  'We can use operational transformations to keep everyone in a multiplayer repl in sync.',
  '[{"op": "delete", "count": 7}, {"op": "insert", "chars": "We"}, {"op": "skip", "count": 4}, {"op": "delete", "count": 1}]'
); # false

ChangesetValidator.new(
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
  '[]'
); # true
