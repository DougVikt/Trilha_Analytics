function FilterSelect({ id, label, value, placeholder, options, onChange }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Filters({ filters, courses, shifts, sections, onChange, onClear }) {
  return (
    <div className="filters">
      <FilterSelect
        id="courseFilter"
        label="Curso"
        value={filters.course}
        placeholder="Todos os cursos"
        options={courses}
        onChange={(value) => onChange('course', value)}
      />
      <FilterSelect
        id="shiftFilter"
        label="Turno"
        value={filters.shift}
        placeholder="Todos os turnos"
        options={shifts}
        onChange={(value) => onChange('shift', value)}
      />
      <FilterSelect
        id="sectionFilter"
        label="Origem dos dados"
        value={filters.section}
        placeholder="Todas as seções"
        options={sections}
        onChange={(value) => onChange('section', value)}
      />
      <button id="clearFilters" className="clear-btn" type="button" onClick={onClear}>
        Limpar filtros
      </button>
    </div>
  );
}
