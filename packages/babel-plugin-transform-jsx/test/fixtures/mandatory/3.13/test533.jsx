<scxml initial="s1" version="1.0">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
    <data id="Var2" expr={ 0 }/>
    <data id="Var3" expr={ 0 }/>
    <data id="Var4" expr={ 0 }/>
  </datamodel>

  <state id="s1">
    <onentry>
      <raise event="foo"/>
      <raise event="bar"/>
    </onentry>
    <transition target="p"/>
  </state>

  <parallel id="p">
    <onexit>
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 } />
    </onexit>
    <transition event="foo" type="internal" target="ps1">
      <assign location="Var4" expr={ ({ Var4 }) => Var4 + 1 } />
    </transition>

    <transition event="bar" cond={ ({ Var4 }) => Var4 == 1 } target="s2"/>
    <transition event="bar" target="fail"/>

    <state id="ps1">
      <onexit>
        <assign location="Var2" expr={ ({ Var2 }) => Var2 + 1 } />
      </onexit>
    </state>
    <state id="ps2">
      <onexit>
        <assign location="Var3" expr={ ({ Var3 }) => Var3 + 1 } />
      </onexit>
    </state>
  </parallel>

  <state id="s2">
    <transition cond={ ({ Var1 }) => Var1 == 2 } target="s3"/>
    <transition target="fail"/>
  </state>

  <state id="s3">
    <transition cond={ ({ Var2 }) => Var2 == 2 } target="s4"/>
    <transition target="fail"/>
  </state>

  <state id="s4">
    <transition cond={ ({ Var3 }) => Var3 == 2 } target="pass"/>
    <transition target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
