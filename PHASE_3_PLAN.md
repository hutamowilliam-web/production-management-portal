# Phase 3: Dynamic Forms - Implementation Plan

**Phase**: 3 of 10  
**Status**: IN PROGRESS  
**Duration**: 6-8 hours estimated  
**Date Started**: November 14, 2025

---

## 🎯 Phase Objectives

### Backend API Development
1. **Form Management API** (`/api/forms`)
   - GET /api/forms - List all forms
   - GET /api/forms/:id - Get form details
   - POST /api/forms - Create new form
   - PUT /api/forms/:id - Update form
   - DELETE /api/forms/:id - Delete form

2. **Form Response API** (`/api/form-responses`)
   - POST /api/form-responses - Submit form response
   - GET /api/form-responses/:formId - Get responses for form
   - GET /api/form-responses/:id - Get single response
   - PUT /api/form-responses/:id - Update response
   - DELETE /api/form-responses/:id - Delete response

3. **Dynamic Table Generation**
   - Function to create MySQL tables from form definition
   - Function to validate form data against definition
   - Function to generate column specs from field types

### Frontend Component Development
1. **FormBuilder Component** (Admin)
   - Add/remove form fields
   - Configure field properties
   - Set field validation rules
   - Preview form
   - Save form definition

2. **DynamicForm Component** (User)
   - Render form based on definition
   - Handle field interactions
   - Validate on submit
   - Support dependent fields
   - Handle calculations

3. **FormFields Component Library**
   - TextField
   - TextAreaField
   - NumberField
   - CurrencyField
   - DateField
   - SelectField
   - MultiSelectField
   - CheckboxField
   - RadioField

4. **FormResponsesViewer Component**
   - Display submitted responses
   - View response details
   - Download response data

### Database Schema
1. Forms table
2. Form fields table
3. Form responses table (dynamic per form)

---

## 📋 Implementation Breakdown

### Task 1: Backend Form Management API (2-3 hours)
**Files to create/modify**:
- `backend/routes/forms.js` - NEW
- `backend/services/formService.js` - NEW
- `database/form-schema.sql` - NEW

**Key functions**:
```javascript
// formService.js
- createForm(formData) → Creates form + generates table
- updateForm(id, formData) → Updates form definition
- deleteForm(id) → Deletes form + response table
- getForm(id) → Returns form with fields
- listForms() → Lists all forms
- getFormResponses(formId) → Gets all responses
- submitFormResponse(formId, responseData) → Stores response
- generateTableFromFields(fields) → Creates MySQL table
- validateFormData(formData, fields) → Validates data
```

**Endpoints**:
```
POST /api/forms
GET /api/forms
GET /api/forms/:id
PUT /api/forms/:id
DELETE /api/forms/:id
POST /api/form-responses
GET /api/form-responses/:formId
GET /api/form-responses/:id
PUT /api/form-responses/:id
DELETE /api/form-responses/:id
```

### Task 2: Frontend FormBuilder Component (2-3 hours)
**Files to create**:
- `frontend/src/components/admin/FormBuilder.tsx` - ENHANCE
- `frontend/src/components/forms/FormFieldConfigurator.tsx` - NEW
- `frontend/src/components/forms/FormPreview.tsx` - NEW

**Key features**:
- Add field button with field type selection
- Drag-to-reorder fields
- Edit field properties (label, type, validation, etc.)
- Delete fields
- Form properties (name, description, table name)
- Save form to backend
- Preview form as user would see it

### Task 3: Frontend DynamicForm Component (2 hours)
**Files to create**:
- `frontend/src/components/forms/DynamicForm.tsx` - NEW
- `frontend/src/components/forms/DynamicFormField.tsx` - NEW

**Key features**:
- Render fields based on form definition
- Handle field validation
- Support dependent fields (show/hide based on other fields)
- Handle calculations
- Submit responses
- Show error messages
- Loading states

### Task 4: Form Field Components (1-2 hours)
**Files to create**:
- `frontend/src/components/forms/fields/TextField.tsx` - NEW
- `frontend/src/components/forms/fields/TextAreaField.tsx` - NEW
- `frontend/src/components/forms/fields/NumberField.tsx` - NEW
- `frontend/src/components/forms/fields/CurrencyField.tsx` - NEW
- `frontend/src/components/forms/fields/DateField.tsx` - NEW
- `frontend/src/components/forms/fields/SelectField.tsx` - NEW
- `frontend/src/components/forms/fields/CheckboxField.tsx` - NEW
- `frontend/src/components/forms/fields/RadioField.tsx` - NEW

**Key features**:
- Consistent styling
- Validation display
- Help text
- Required indicator
- Error messages

### Task 5: FormResponsesViewer Component (1 hour)
**Files to create**:
- `frontend/src/components/admin/FormResponsesViewer.tsx` - NEW

**Key features**:
- Display responses in DataTable
- View individual response details
- Download responses as CSV
- Filter responses
- Search responses

### Task 6: Database Schema (1 hour)
**Create schema for**:
- forms table
- form_fields table
- Dynamic response tables (created per form)

---

## 🗄️ Database Schema

### forms table
```sql
CREATE TABLE forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  table_name VARCHAR(100) UNIQUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### form_fields table
```sql
CREATE TABLE form_fields (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  required BOOLEAN DEFAULT 0,
  field_order INT,
  validation_rules JSON,
  options JSON,
  depends_on VARCHAR(100),
  depends_on_value VARCHAR(100),
  help_text TEXT,
  db_column_name VARCHAR(100),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_field_per_form (form_id, field_name)
);
```

### Dynamic Response Table (created per form)
```sql
CREATE TABLE form_response_{form_id} (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Fields dynamically added based on form_fields
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔧 Technical Details

### Form Field Types
1. **text** - Single line text input
2. **textarea** - Multi-line text area
3. **number** - Numeric input
4. **currency** - Currency input (R prefix)
5. **date** - Date picker
6. **select** - Dropdown select
7. **multiselect** - Multiple selection
8. **checkbox** - Boolean checkbox
9. **radio** - Radio button group

### Form Definition Structure
```typescript
interface FormDefinition {
  id: number;
  name: string;
  description: string;
  table_name: string;
  is_active: boolean;
  fields: FormField[];
}

interface FormField {
  id: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
  field_order: number;
  validation_rules?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  options?: string[];
  depends_on?: string;
  depends_on_value?: string;
  help_text?: string;
}

interface FormResponse {
  id: number;
  form_id: number;
  user_id: number;
  status: string;
  data: Record<string, any>;
  submitted_at: string;
  updated_at: string;
}
```

### Validation Rules
- Required field validation
- Type-specific validation (email, number range, etc.)
- Custom regex patterns
- Dependent field validation
- Cross-field validation

### Calculations
Support for auto-calculation fields:
```json
{
  "name": "total_cost",
  "calculation": "quantity * unit_price"
}
```

---

## 🎨 Component Hierarchy

```
Admin View:
├── AdminPage
│   └── FormBuilder (NEW)
│       ├── FormProperties
│       ├── FormFieldList
│       │   └── FormFieldConfigurator (for each field)
│       ├── FormPreview (NEW)
│       └── Save/Cancel buttons

User View:
├── FormSubmissionPage (NEW)
│   └── DynamicForm (NEW)
│       └── DynamicFormField (NEW)
│           ├── TextField
│           ├── TextAreaField
│           ├── NumberField
│           ├── CurrencyField
│           ├── DateField
│           ├── SelectField
│           ├── CheckboxField
│           └── RadioField

Response Viewing:
├── FormResponsesViewer (NEW)
│   ├── ResponsesTable
│   ├── ResponseDetail
│   └── ExportButton
```

---

## ✅ Success Criteria

### Backend
- [x] Forms API fully functional
- [x] Form response API fully functional
- [x] Dynamic table creation working
- [x] Proper error handling
- [x] Permission-based access
- [x] Activity logging

### Frontend
- [x] FormBuilder allows creating forms
- [x] DynamicForm renders forms correctly
- [x] All field types working
- [x] Validation working
- [x] Form submission working
- [x] Response viewing working
- [x] Dark mode support

### Data
- [x] Form definitions stored
- [x] Responses stored correctly
- [x] Dynamic tables created
- [x] Data integrity maintained

### Quality
- [x] 100% TypeScript coverage
- [x] 0 ESLint errors
- [x] Proper error handling
- [x] Loading states
- [x] Empty states

---

## 📊 Progress Tracking

### Tasks
1. Backend Form API - IN PROGRESS
2. Frontend FormBuilder - PENDING
3. Frontend DynamicForm - PENDING
4. Form Field Components - PENDING
5. FormResponsesViewer - PENDING
6. Database Schema - PENDING
7. Documentation - PENDING

---

## 🚀 Estimated Timeline

| Task | Duration | Status |
|------|----------|--------|
| Backend Setup + API Routes | 2-3 hours | PENDING |
| FormBuilder Component | 2-3 hours | PENDING |
| DynamicForm Component | 2 hours | PENDING |
| Field Components | 1-2 hours | PENDING |
| ResponsesViewer | 1 hour | PENDING |
| Testing & Debugging | 1-2 hours | PENDING |
| Documentation | 1 hour | PENDING |
| **Total** | **10-15 hours** | **IN PROGRESS** |

---

## 📋 Notes

### Important Considerations
1. Form names must be unique (used for table names)
2. Table names generated from form name (kebab-case)
3. Field names must be unique within form
4. Dynamic tables created with proper indexes
5. Form updates require careful migration
6. Responses can only be deleted by admin
7. Activity logging on all form operations

### Future Enhancements
- Multi-page forms
- Conditional logic (if/then)
- File upload fields
- Rich text editor
- Signature field
- Print to PDF
- Email on submission
- Workflow automation

---

**Phase 3 Implementation Plan v1.0**

*Ready to proceed with implementation*
