import React from 'react';
import CreatableSelect from 'react-select/creatable';

export const CreatableMulti = ({value, editTagData, idx}) => {


    const handleChange = (newValue, actionMeta) => {
        console.group('Value Changed');
        console.log(newValue);
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();
        editTagData(idx, newValue)
    };
    const createOption = (label) => ({
        label,
        value: label.toLowerCase().replace(/\W/g, ''),
    });

    return (
        <CreatableSelect
            placeholder='Add tags...'
            isMulti
            onChange={handleChange}
            options={[]}
            value={value}
        />
    );
}
