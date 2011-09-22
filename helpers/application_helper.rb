module ApplicationHelper

  def dom_id_with_jasmine(record, prefix=nil)
    if record.respond_to?(:dom_id)
        [prefex, record.dom_id].compact * '_'
    else
      dom_id_without_jasmine(record, prefix)
    end
  end

  alias_method_chain :dom_id, :jasmine
end
