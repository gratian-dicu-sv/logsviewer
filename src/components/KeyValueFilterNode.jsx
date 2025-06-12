import { Handle, Position, useReactFlow } from '@xyflow/react';

export function KeyValueFilterNode({ id, data: {deviceId, label, filters, key } }) {
    const { setNodes } = useReactFlow();

    const updateLoggerFilter = (key, filterValue) => (event) => {
        const isChecked = event.target.checked;
        setNodes((nds => {
            return nds.map(n => {
                if (n.id === `messages-${deviceId}`) {
                    let f = []
                    const adjustedFilterValues = n.data.filters.find(f => f.key === key).values;
                    if (isChecked) {
                        f = [...adjustedFilterValues, filterValue]
                    } else {
                        f = adjustedFilterValues.filter(f=> f!==filterValue)
                    } 
                    n.data.filters.find(f => f.key === key).values = f;
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            filters: [
                                ...n.data.filters,
                            ]
                        }
                    }
                }
                return n;
            });
        }));
    }

    return (
        <>
            <Handle type="target" position={Position.Right} id="a" />
            <p className='filterHeader'>{label}</p>
            <div>
                {
                    filters && filters.map((filterValue) => filterValue && (
                        <div key={filterValue} style={{ margin: '5px 0' }}>
                            <input
                                id={`checkbox-${id}-${filterValue}`}
                                type="checkbox"
                                label={filterValue}
                                key={filterValue}
                                value={filterValue}
                                onChange={updateLoggerFilter(key, filterValue)} />
                            <label for={`checkbox-${id}-${filterValue}`}>
                                {filterValue}
                            </label>
                        </div>
                    ))
                }
            </div>
        </>
    );

}