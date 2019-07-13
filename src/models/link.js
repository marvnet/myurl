
module.exports = (sequelize, DataTypes) => {
    const Link = sequelize.define('Link', {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        shortcode: {
            type: DataTypes.STRING
        },
        target: {
            type: DataTypes.TEXT
        },
        title: {
            type: DataTypes.STRING
        }
    }, {})

    return Link
}