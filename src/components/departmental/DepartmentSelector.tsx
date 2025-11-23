import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DEPARTMENTS = [
  'Corporate Services',
  'Finance',
  'Human Resources',
  'Infrastructure',
  'Community Services',
  'Planning',
  'Economic Development',
  'Public Safety',
  'Legal Services',
  'ICT',
];

interface DepartmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const DepartmentSelector = ({ 
  value, 
  onChange, 
  label = "Department",
  placeholder = "Select department"
}: DepartmentSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { DEPARTMENTS };
