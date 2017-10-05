<scxml version="1.0" initial="p1">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <parallel id="p1">
    <onentry>
      <send delay="2s" event="timeout"/>
    </onentry>

    <state id="s0">
      <transition cond={ (_, { In }) => In('sh1') } target="fail"/>
      <transition event="timeout" target="fail"/>
    </state>

    <state id="s1">
      <initial>
        <transition target="sh1"/>
      </initial>

      <history id="sh1">
        <transition target="s11"/>
      </history>

      <state id="s11">
        <transition cond={ (_, { In }) => In('sh1') } target="fail"/>
        <transition target="s12"/>
      </state>

      <state id="s12"/>
      <transition cond={ (_, { In }) => In('sh1') } target="fail"/>
      <transition cond={ ({ Var1 }) => Var1 == 0 } target="sh1"/>
      <transition cond={ ({ Var1 }) => Var1 == 1 } target="pass"/>

      <onexit>
        <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
      </onexit>
    </state>
  </parallel>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
