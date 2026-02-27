-- Migration 00004: Auto-audit on document status change

CREATE OR REPLACE FUNCTION audit_document_state_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (
      document_id,
      action,
      actor_id,
      actor_email,
      actor_role,
      old_status,
      new_status,
      details
    )
    SELECT
      NEW.id,
      'status_change'::audit_action,
      auth.uid(),
      p.email,
      p.role,
      OLD.status::TEXT,
      NEW.status::TEXT,
      jsonb_build_object(
        'title', NEW.title,
        'reviewed_by', NEW.reviewed_by,
        'approved_by', NEW.approved_by
      )
    FROM profiles p
    WHERE p.id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_document_status_change
  AFTER UPDATE OF status ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_document_state_change();
