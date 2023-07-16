	//стили для выпадающего списка
	const CustomSelectStyle = {
		option: (base, state) => ({
			...base,
			backgroundColor: state.isSelected ? 'rgba(99, 161, 98, 0.2);' : 'rgb(255, 255, 255)',
			color: state.isSelected ? 'rgb(255, 255, 255)' : 'rgb(55, 52, 68)',
		})
	}

    export {CustomSelectStyle}